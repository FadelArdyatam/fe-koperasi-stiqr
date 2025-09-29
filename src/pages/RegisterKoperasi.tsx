import { useState } from "react";
import axiosInstance from "@/hooks/axiosInstance";

const RegisterKoperasi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    // user
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    gender: "Laki - Laki",
    dateOfBirth: "1990-01-01",
    nik: "0000000000000000",
    // merchant
    merchantName: "",
    merchantEmail: "",
    phoneNumberMerchant: "",
    merchantAddress: "",
    postalCode: "",
    // koperasi
    kode_koperasi: "",
    nama_koperasi: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await axiosInstance.post("/register/induk-koperasi", form);
      console.log("[RegisterKoperasi] success:", res.data);
      setMessage("Registrasi Koperasi Induk berhasil");
    } catch (err: any) {
      console.log("[RegisterKoperasi] error:", err?.response?.data || err?.message);
      setError(err?.response?.data?.message || err?.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            Registrasi Koperasi Induk
          </h1>
          <p className="text-orange-500 text-lg">
            Daftarkan koperasi Anda dan mulai berkembang bersama kami
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {/* Akun Owner Section */}
            <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                Akun Owner
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">Nama Owner</label>
                  <input
                    name="username"
                    placeholder="Masukkan nama lengkap"
                    value={form.username}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">Email Owner</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="owner@example.com"
                    value={form.email}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">No HP Owner</label>
                  <input
                    name="phone_number"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone_number}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">NIK Owner</label>
                  <input
                    name="nik"
                    placeholder="16 digit NIK"
                    value={form.nik}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-orange-800">Konfirmasi Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Merchant Section */}
            <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-500">
              <h3 className="text-xl font-semibold text-amber-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-amber-500 rounded-full mr-3"></span>
                Merchant (Toko Koperasi)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800">Nama Toko</label>
                  <input
                    name="merchantName"
                    placeholder="Nama toko koperasi"
                    value={form.merchantName}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800">Email Toko</label>
                  <input
                    name="merchantEmail"
                    type="email"
                    placeholder="toko@koperasi.com"
                    value={form.merchantEmail}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800">No HP Toko</label>
                  <input
                    name="phoneNumberMerchant"
                    placeholder="08xxxxxxxxxx"
                    value={form.phoneNumberMerchant}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-800">Kode Pos</label>
                  <input
                    name="postalCode"
                    placeholder="Kode pos lokasi"
                    value={form.postalCode}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-amber-800">Alamat Toko</label>
                  <input
                    name="merchantAddress"
                    placeholder="Alamat lengkap toko koperasi"
                    value={form.merchantAddress}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Data Koperasi Section */}
            <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-500">
              <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                Data Koperasi
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-yellow-800">Kode Koperasi</label>
                  <input
                    name="kode_koperasi"
                    placeholder="Kode unik koperasi"
                    value={form.kode_koperasi}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-yellow-800">Nama Koperasi</label>
                  <input
                    name="nama_koperasi"
                    placeholder="Nama lengkap koperasi"
                    value={form.nama_koperasi}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠</span>
                  {error}
                </div>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {message}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-amber-600 transform hover:-translate-y-1 transition-all duration-200 disabled:from-orange-300 disabled:to-amber-300 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Mendaftarkan...
                </div>
              ) : (
                "Daftarkan Koperasi"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-orange-400 text-sm">
          <p>Pastikan semua data yang dimasukkan sudah benar dan valid</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterKoperasi;