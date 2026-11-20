"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { NIGERIAN_STATES, addressSchema, type AddressDTO, type AddressInput } from "@pickova/shared";
import { LoadError, Loading } from "@/components/account/AccountShell";
import { Field, FormError, useServerErrors } from "@/components/ui/Form";
import { ApiRequestError, api } from "@/lib/api";
import { useAccountData } from "@/lib/use-api";
import { useToasts } from "@/stores/toast";

const toInput = (a: AddressDTO): AddressInput => ({
  label: a.label,
  recipientName: a.recipientName,
  phone: a.phone,
  state: a.state as AddressInput["state"],
  city: a.city,
  line1: a.line1,
  instructions: a.instructions ?? "",
  isDefault: a.isDefault,
});

function AddressForm({ address, isFirst, onSaved, onCancel }: { address: AddressDTO | null; isFirst: boolean; onSaved: () => void; onCancel: () => void }) {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: address ? toInput(address) : { label: "Home", isDefault: isFirst },
  });
  const { formError, setFormError, handle } = useServerErrors<AddressInput>(setError);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api(address ? `/account/addresses/${address.id}` : "/account/addresses", { method: address ? "PUT" : "POST", body: values });
      onSaved();
    } catch (e) {
      handle(e);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6">
      <h2 className="text-xl">{address ? "Edit address" : "Add a new address"}</h2>
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="label" label="Address name" placeholder="Home, Office…" register={register} errors={errors} />
        <Field name="recipientName" label="Recipient's full name" autoComplete="name" register={register} errors={errors} />
        <Field name="phone" label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" register={register} errors={errors} />
        <div>
          <label htmlFor="state" className="field-label">State</label>
          <select id="state" {...register("state")} defaultValue={address?.state ?? ""} aria-invalid={errors.state ? true : undefined} aria-describedby={errors.state ? "state-error" : undefined} className="field-input">
            <option value="" disabled>Choose a state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p id="state-error" role="alert" className="field-error">{errors.state.message}</p>}
        </div>
        <Field name="city" label="City / Town" autoComplete="address-level2" register={register} errors={errors} />
        <Field name="line1" label="Street address" autoComplete="street-address" placeholder="House number, street, area" register={register} errors={errors} />
      </div>
      <Field name="instructions" label="Delivery instructions (optional)" placeholder="Landmark, gate colour, best time to call…" register={register} errors={errors} />
      {!(address?.isDefault || isFirst) && (
        <label className="flex min-h-8 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" {...register("isDefault")} className="size-5 rounded accent-[#F28C28]" />
          Make this my default delivery address
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Saving…" : "Save Address"}</button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}

export default function AddressesPage() {
  const { data: addresses, error, loading, reload } = useAccountData<AddressDTO[]>("/account/addresses");
  const toast = useToasts((s) => s.push);
  /** null = list view, "new" = adding, otherwise the address being edited */
  const [editing, setEditing] = useState<AddressDTO | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<unknown>, done: string) {
    setBusy(id);
    try {
      await action();
      await reload();
      toast({ message: done });
    } catch (e) {
      toast({ tone: "error", message: e instanceof ApiRequestError ? e.message : "Something went wrong. Please try again." });
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl">Saved Addresses</h1>
        {!editing && addresses && addresses.length > 0 && (
          <button type="button" onClick={() => setEditing("new")} className="btn-primary">
            <Plus className="size-4" aria-hidden /> Add Address
          </button>
        )}
      </div>

      <div className="mt-8">
        {loading && !addresses ? (
          <Loading label="Loading your addresses" />
        ) : error || !addresses ? (
          <LoadError message={error ?? "We couldn't load your addresses."} onRetry={reload} />
        ) : editing ? (
          <AddressForm
            key={editing === "new" ? "new" : editing.id}
            address={editing === "new" ? null : editing}
            isFirst={addresses.length === 0}
            onCancel={() => setEditing(null)}
            onSaved={async () => {
              setEditing(null);
              await reload();
              toast({ message: "Address saved." });
            }}
          />
        ) : addresses.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <MapPin className="size-12 text-navy-200" aria-hidden />
            <h2 className="mt-4 text-xl">No saved addresses</h2>
            <p className="mt-2 max-w-sm text-sm text-navy-400">Add your delivery address now and checkout will be quicker.</p>
            <button type="button" onClick={() => setEditing("new")} className="btn-primary mt-6">
              <Plus className="size-4" aria-hidden /> Add Address
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {addresses.map((a) => (
              <li key={a.id} className="card flex flex-col p-5" aria-busy={busy === a.id}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg">{a.label}</h2>
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-navy">
                      <Star className="size-3 fill-orange text-orange" aria-hidden /> Default
                    </span>
                  )}
                </div>
                <div className="mt-3 flex-1 text-sm leading-relaxed text-navy-500">
                  <p className="font-medium text-navy">{a.recipientName}</p>
                  <p>{a.line1}</p>
                  <p>{a.city}, {a.state}</p>
                  <p>{a.phone}</p>
                  {a.instructions && <p className="mt-1 text-navy-400">Note: {a.instructions}</p>}
                </div>
                {confirmDelete === a.id ? (
                  <div role="alertdialog" aria-label={`Delete ${a.label} address?`} className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <p className="mr-auto text-sm font-medium">Delete this address?</p>
                    <button type="button" className="btn min-h-10 bg-danger px-4 text-white hover:opacity-90" disabled={busy === a.id} onClick={() => run(a.id, () => api(`/account/addresses/${a.id}`, { method: "DELETE" }), "Address deleted.")}>
                      Yes, delete
                    </button>
                    <button type="button" className="btn-outline min-h-10 px-4" onClick={() => setConfirmDelete(null)}>Keep</button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <button type="button" className="btn-outline min-h-10 px-4" onClick={() => setEditing(a)}>
                      <Pencil className="size-4" aria-hidden /> Edit
                    </button>
                    {!a.isDefault && (
                      <button type="button" className="btn-outline min-h-10 px-4" disabled={busy === a.id} onClick={() => run(a.id, () => api(`/account/addresses/${a.id}`, { method: "PUT", body: { ...toInput(a), isDefault: true } }), "Default address updated.")}>
                        Set as default
                      </button>
                    )}
                    <button type="button" className="ml-auto grid size-10 place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-danger" aria-label={`Delete ${a.label} address`} onClick={() => setConfirmDelete(a.id)}>
                      <Trash2 className="size-[1.125rem]" aria-hidden />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
