// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";

// import type React from "react";
// import { useEffect, useState, useCallback, useMemo } from "react";

// /** ---------- UI shims (same styles you already use) ---------- */
// const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
// );
// const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => <div className="border-b px-6 py-4" {...props} />;
// const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
//   <h2 className="text-xl font-bold" {...props}>{children}</h2>
// );
// const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
//   <p className="text-gray-500 text-sm" {...props}>{children}</p>
// );
// const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div className="p-6" {...props}>{children}</div>
// );
// const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
//   <button className={`inline-flex items-center px-4 py-2 rounded border bg-[#6B0F10] text-white hover:bg-red-700 disabled:opacity-50 ${className}`} {...props}>
//     {children}
//   </button>
// );
// const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="border rounded px-3 py-2 w-full" {...props} />;
// const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
//   <label className="block font-medium mb-1" {...props}>{children}</label>
// );
// const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="border rounded px-3 py-2 w-full" {...props} />;
// const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; }) => (
//   <select className="border rounded px-3 py-2 w-full" value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>
// );
// const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;
// const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
// /** ------------------------------------------------------------ */

// interface PersonalDetailsFormProps {
//   onNext: () => void;
// }

// type NationalityEntry = {
//   label: string;          // e.g. "Ghanaian"
//   value: string | null;   // ISO alpha-2 code like "GH" or null if ambiguous
// };

// function slugify(label: string) {
//   return label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
// }

// export function PersonalDetailsForm({ onNext }: PersonalDetailsFormProps) {
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     firstName: "", lastName: "", email: "", phone: "",
//     nationality: "", address: "", emergencyContact: "",
//   });
//   const [dateOfBirth, setDateOfBirth] = useState<string>("");

//   // ---- Load nationalities JSON from /public ----
//   const [nationalities, setNationalities] = useState<NationalityEntry[]>([]);
//   const [natsLoading, setNatsLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         // Place your JSON at: public/nationalities_with_codes.json
//         const res = await fetch("/nationalities_with_codes.json", { cache: "force-cache" });
//         if (!res.ok) throw new Error("nationalities JSON not found");
//         const data = (await res.json()) as NationalityEntry[];
//         setNationalities(data);
//       } catch {
//         // Fallback minimal list if JSON missing (keeps UI usable)
//         setNationalities([
//           { label: "Ghanaian", value: "GH" },
//           { label: "Nigerian", value: "NG" },
//           { label: "Kenyan", value: "KE" },
//           { label: "South African", value: "ZA" },
//           { label: "American", value: "US" },
//           { label: "British", value: "GB" },
//           { label: "Canadian", value: "CA" },
//           { label: "French", value: "FR" },
//           { label: "German", value: "DE" },
//           { label: "Australian", value: "AU" },
//         ]);
//       } finally {
//         setNatsLoading(false);
//       }
//     })();
//   }, []);

//   // Prefill from /api/profile
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/profile");
//         if (!res.ok) throw new Error("Failed to load profile");
//         const { profile } = await res.json();
//         if (profile) {
//           setFormData({
//             firstName: profile.first_name ?? "",
//             lastName: profile.last_name ?? "",
//             email: profile.email ?? "",
//             phone: profile.phone ?? "",
//             nationality: profile.nationality ?? "",
//             address: profile.address ?? "",
//             emergencyContact: profile.emergency_contact ?? "",
//           });
//           setDateOfBirth(profile.dob ? String(profile.dob).slice(0, 10) : "");
//         }
//       } catch {
//         // ignore
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const handleInputChange = useCallback((field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleSubmit = useCallback(async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await fetch("/api/profile", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           first_name: formData.firstName,
//           last_name: formData.lastName,
//           email: formData.email,
//           phone: formData.phone,
//           dob: dateOfBirth || null,
//           nationality: formData.nationality,
//           address: formData.address,
//           emergency_contact: formData.emergencyContact,
//         }),
//       });
//       onNext();
//     } catch (err: any) {
//       alert(err?.message || "Failed to save personal details");
//     }
//   }, [formData, dateOfBirth, onNext]);

//   // Build safe select options (prefer ISO code; fall back to label slug)
//   const natOptions = useMemo(() => {
//     return nationalities.map((n) => {
//       const value = n.value ?? `label:${slugify(n.label)}`;
//       return { value, label: n.label };
//     });
//   }, [nationalities]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Personal Details</CardTitle>
//         <CardDescription>Provide your basic personal information</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="text-sm text-gray-600">Loading profile…</div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">First Name *</Label>
//                 <Input type="text" id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Last Name *</Label>
//                 <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address *</Label>
//                 <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number *</Label>
//                 <Input type="number" id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label>Date of Birth *</Label>
//                 <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="nationality">Nationality *</Label>
//                 <Select
//                   value={formData.nationality}
//                   onValueChange={(v) => handleInputChange("nationality", v)}
//                 >
//                   <SelectValue placeholder={natsLoading ? "Loading nationalities…" : "Select nationality"} />
//                   {natOptions.map((opt) => (
//                     <SelectItem key={opt.label} value={opt.label}>
//                       {opt.label}
//                     </SelectItem>
//                   ))}
//                   <SelectItem value="other">Other</SelectItem>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="address">Current Address *</Label>
//               <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="emergencyContact">Emergency Contact *</Label>
//               <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleInputChange("emergencyContact", e.target.value)} required />
//             </div>

//             <div className="flex justify-end">
//               <Button type="submit">Next: Academic Background</Button>
//             </div>
//           </form>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
