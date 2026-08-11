"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Partner {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface AssignPartnerProps {
  deliveryId: string;
  onAssigned?: () => void;
}

export default function AssignPartner({
  deliveryId,
  onAssigned,
}: AssignPartnerProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [open, setOpen] = useState(false);
  const [assigningPartnerId, setAssigningPartnerId] = useState("");

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    const { data, error } = await supabase
      .from("delivery_partners")
      .select("id, full_name, phone")
      .eq("is_available", true);

    if (error) {
      console.error("PARTNER LOAD ERROR:", error);
      return;
    }

    setPartners(data || []);
  }

  async function assignPartner(partnerId: string) {
    setAssigningPartnerId(partnerId);

    const { error } = await supabase
      .from("deliveries")
      .update({
        partner_id: partnerId,
        pickup_status: "Assigned",
      })
      .eq("id", deliveryId);

    setAssigningPartnerId("");

    if (error) {
      console.error("ASSIGN ERROR:", error);
      alert("Partner assignment failed.");
      return;
    }

    alert("Partner assigned successfully.");
    setOpen(false);

    onAssigned?.();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        {open ? "Close" : "Assign Partner"}
      </button>

      {open && (
        <div className="mt-4 rounded-xl bg-slate-100 p-4">
          <h3 className="mb-3 font-bold">Select Partner</h3>

          {partners.length === 0 ? (
            <p className="text-slate-500">
              No available delivery partners found.
            </p>
          ) : (
            <div className="space-y-2">
              {partners.map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => assignPartner(partner.id)}
                  disabled={assigningPartnerId === partner.id}
                  className="block w-full rounded-lg bg-white p-3 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="font-bold">
                    {partner.full_name || "Unknown Partner"}
                  </p>

                  <p className="text-sm text-slate-500">
                    {partner.phone || "No phone number"}
                  </p>

                  {assigningPartnerId === partner.id && (
                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      Assigning...
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}