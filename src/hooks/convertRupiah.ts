export function formatRupiah(value: number | string, prefix: string = 'Rp '): string {
    // Validasi input harus berupa number atau string
    if (typeof value !== 'number' && typeof value !== 'string') {
        throw new Error('Input harus berupa angka atau string.');
    }

    // Konversi ke string jika input berupa angka
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // Tambahkan tanda titik jika ada kelompok ribuan
    if (ribuan) {
        const separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    // Tambahkan bagian desimal jika ada
    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;

    // Tambahkan prefix jika diberikan
    return `${prefix}${rupiah}`;
}
