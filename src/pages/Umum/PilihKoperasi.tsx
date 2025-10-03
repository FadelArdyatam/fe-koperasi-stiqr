import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/hooks/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2 } from 'lucide-react';
import Notification from '@/components/Notification';

interface Koperasi {
    id: string;
    nama_koperasi: string;
    alamat: string;
    kota: string;
    provinsi: string;
}

const PilihKoperasi: React.FC = () => {
    const navigate = useNavigate();
    const [koperasiList, setKoperasiList] = useState<Koperasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKoperasiList = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/koperasi/list');
                setKoperasiList(response.data || []);
            } catch (err) {
                setError('Gagal memuat daftar koperasi.');
                console.error("Error fetching koperasi list:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchKoperasiList();
    }, []);

    const SkeletonCard = () => (
        <Card className="animate-pulse">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                <div className="space-y-2 flex-grow">
                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="pb-4 bg-gray-50 min-h-screen">
            {error && <Notification message={error} status="error" onClose={() => setError(null)} />}

            <header className="p-4 flex items-center gap-4 mb-0 bg-white border-b sticky top-0 z-20">
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold">Pilih Koperasi</h1>
            </header>

            <div className="p-4 space-y-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                ) : koperasiList.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-lg border">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak Ada Koperasi</h3>
                        <p className="mt-1 text-sm text-gray-500">Saat ini belum ada koperasi yang terdaftar.</p>
                    </div>
                ) : (
                    koperasiList.map((koperasi) => (
                        <Link key={koperasi.id} to={`/koperasi/${koperasi.id}/katalog`} className="block">
                            <Card className="hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <Building2 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{koperasi.nama_koperasi}</p>
                                        <p className="text-sm text-gray-500">{koperasi.kota}, {koperasi.provinsi}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default PilihKoperasi;
