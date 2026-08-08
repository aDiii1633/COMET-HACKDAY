"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, ShieldCheck, Activity, MapPin, Loader2, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { guardiansApi } from "@/lib/api/services";
import toast from "react-hot-toast";

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<Array<{guardian_id?: string, name: string, relation: string, phone_number: string, email?: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "Family", phone_number: "", email: "" });

  useEffect(() => {
    async function load() {
      const data = await guardiansApi.list();
      setGuardians(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAdd() {
    if (!form.name || !form.phone_number) {
      toast.error("Name and phone number are required.");
      return;
    }
    setSubmitting(true);
    try {
      const newGuardian = await guardiansApi.add(form);
      setGuardians([...guardians, newGuardian]);
      toast.success(`${form.name} added as a Guardian!`);
      setShowModal(false);
      setForm({ name: "", relation: "Family", phone_number: "", email: "" });
    } catch (e: unknown) {
      toast.error((e as {response?: {data?: {detail?: string}}})?.response?.data?.detail || "Failed to add guardian.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 text-[#15803D] animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#172018] tracking-tight flex items-center">
            <Users className="mr-3 h-8 w-8 text-[#15803D]" /> Guardian Circle
          </h1>
          <p className="text-[#4B5563] mt-1 font-medium text-sm">Trusted contacts who receive your emergency alerts.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Add Guardian
        </Button>
      </div>

      {/* Add Guardian Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#172018]/50 backdrop-blur-xs p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#FFFFFF] border border-[#DDE8DF] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#DDE8DF] pb-3">
                <h3 className="text-xl font-bold text-[#172018]">Add Guardian</h3>
                <Button size="icon" variant="ghost" onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#172018]"><X className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Full Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sarah Connor" className="bg-[#FFFFFF]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Relationship</label>
                  <select value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#DDE8DF] rounded-xl px-3.5 py-2 text-[#172018] text-sm focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 outline-none">
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Phone Number</label>
                  <Input value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} placeholder="+91 98765 43210" className="bg-[#FFFFFF]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Email Address (optional)</label>
                  <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="guardian@email.com" className="bg-[#FFFFFF]" />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={submitting} className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold h-11">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting ? "Adding..." : "Add Guardian"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guardians List — LIVE from backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guardians.length === 0 ? (
          <Card className="neo-card col-span-full p-8 text-center bg-[#FFFFFF]">
            <p className="text-[#6B7280] font-medium">No guardians added yet. Add your trusted contacts to activate the Guardian Circle.</p>
          </Card>
        ) : (
          guardians.map((guardian, idx) => (
            <motion.div key={guardian.guardian_id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Card className="neo-card h-full bg-[#FFFFFF]">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#172018]">{guardian.name}</CardTitle>
                    <CardDescription className="text-[#4B5563] font-medium text-xs mt-0.5">{guardian.relation}</CardDescription>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-[#15803D]" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-[#4B5563] font-medium">
                    <Activity className="mr-2.5 h-4 w-4 text-[#15803D]" />
                    {guardian.phone_number}
                  </div>
                  <div className="flex items-center text-sm text-[#4B5563] font-medium">
                    <MapPin className="mr-2.5 h-4 w-4 text-[#15803D]" />
                    Alert Ready
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Card className="neo-card border-[#86EFAC] bg-[#F0FDF4]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#14532D] flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-[#15803D]" /> End-to-End Privacy Guaranteed</h3>
            <p className="text-sm text-[#166534] mt-1 font-medium">Your live location is only shared with Guardians during an active SafeRoute navigation or Level 2 Emergency pulse.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
