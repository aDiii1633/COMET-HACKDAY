"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Plus, ShieldCheck, MapPin, Clock, Loader2, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api/services";
import toast from "react-hot-toast";

export default function CommunityPage() {
  const [reports, setReports] = useState<Array<{report_id?: string, category: string, description: string, severity: number, h3_index?: string, status?: string, verification_count?: number, image_url?: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "POOR_LIGHTING", severity: 3, description: "", latitude: 28.6139, longitude: 77.2090, image_b64: "" });

  useEffect(() => {
    async function load() {
      const data = await reportsApi.list(50);
      setReports(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit() {
    if (!form.description || form.description.length < 5) {
      toast.error("Description must be at least 5 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const newReport = await reportsApi.submit(form);
      setReports([newReport, ...reports]);
      toast.success("Report submitted! Thank you for keeping the community safe.");
      setShowModal(false);
      setForm({ category: "POOR_LIGHTING", severity: 3, description: "", latitude: 28.6139, longitude: 77.2090, image_b64: "" });
    } catch (e: unknown) {
      toast.error((e as {response?: {data?: {detail?: string}}})?.response?.data?.detail || "Failed to submit report.");
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
            <AlertTriangle className="mr-3 h-8 w-8 text-[#B45309]" /> Community Reports
          </h1>
          <p className="text-[#4B5563] mt-1 font-medium text-sm">Crowdsourced threat intelligence and live incident reports near you.</p>
        </div>
        <Button onClick={() => {
          setShowModal(true);
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
              (err) => console.warn("Geolocation failed", err)
            );
          }
        }} className="bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Report Incident
        </Button>
      </div>

      {/* Submit Report Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#172018]/50 backdrop-blur-xs p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#FFFFFF] border border-[#DDE8DF] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#DDE8DF] pb-3">
                <h3 className="text-xl font-bold text-[#172018]">Report Incident</h3>
                <Button size="icon" variant="ghost" onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#172018]"><X className="h-5 w-5" /></Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#DDE8DF] rounded-xl px-3.5 py-2 text-[#172018] text-sm focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 outline-none">
                    <option value="POOR_LIGHTING">Poor Lighting</option>
                    <option value="HARASSMENT_HOTSPOT">Harassment</option>
                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                    <option value="STALKING">Stalking</option>
                    <option value="THEFT">Theft</option>
                    <option value="PHYSICAL_HAZARD">Physical Hazard</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Severity (1 to 5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} onClick={() => setForm({ ...form, severity: s })} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${form.severity === s ? 'bg-[#15803D] text-[#FFFFFF] shadow-xs' : 'bg-[#F0F5F1] text-[#4B5563] border border-[#DDE8DF] hover:border-[#86EFAC]'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Incident Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened in detail..." className="w-full bg-[#FFFFFF] border border-[#DDE8DF] rounded-xl px-3.5 py-2 text-[#172018] text-sm h-24 resize-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 outline-none placeholder:text-[#6B7280]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Photo Evidence (Optional)</label>
                  <label className="w-full bg-[#F0F5F1] border border-[#DDE8DF] border-dashed rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-[#F0FDF4] hover:border-[#86EFAC] transition-colors block">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setForm({ ...form, image_b64: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="text-xs font-medium text-[#4B5563]">
                      {form.image_b64 ? "Photo Attached ✅ (Click to change)" : "Click to upload photo evidence"}
                    </span>
                  </label>
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-semibold h-11">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List — LIVE from backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, idx) => (
          <motion.div key={report.report_id || idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
            <Card className="neo-card bg-[#FFFFFF] h-full relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-2 h-full ${report.severity >= 4 ? 'bg-[#B91C1C]' : 'bg-[#B45309]'}`} />
              <CardHeader className="pb-3">
                {report.image_url && (
                  <div className="w-full h-32 bg-[#F0F5F1] rounded-lg mb-3 bg-cover bg-center border border-[#DDE8DF]" style={{ backgroundImage: `url(${report.image_url})` }} />
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-[#172018]">{(report.category || "INCIDENT").replace(/_/g, " ")}</CardTitle>
                    <CardDescription className="flex items-center mt-1 text-xs text-[#4B5563] font-medium"><MapPin className="mr-1 h-3 w-3 text-[#15803D]" />{report.h3_index || "Nearby"}</CardDescription>
                  </div>
                  <div className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${report.status === 'VERIFIED' ? 'bg-[#DCFCE7] text-[#14532D]' : 'bg-[#FEF3C7] text-[#78350F]'}`}>
                    {report.status || "PENDING"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#4B5563] line-clamp-2 leading-relaxed">{report.description}</p>
                <div className="flex items-center text-xs text-[#6B7280] font-medium">
                  <Clock className="mr-1 h-3 w-3 text-[#15803D]" /> Severity: <span className="font-bold text-[#172018] ml-1">{report.severity}/5</span>
                  {report.verification_count !== undefined && <span className="ml-3">• {report.verification_count} verifications</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <Card className="neo-card border-[#86EFAC] bg-[#F0FDF4]">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#14532D] flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-[#15803D]" /> AI Verification Layer</h3>
              <p className="text-sm text-[#166534] font-medium">All reports are cross-referenced with spatial clustering and historical crime metrics before adjusting area risk scores.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
