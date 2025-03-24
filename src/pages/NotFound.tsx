import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>

            <p className="text-gray-600 mt-5">Oops! Halaman yang kamu cari tidak ditemukan.</p>

            <Link to="/" className="mt-5 px-4 py-2 bg-orange-500 text-white rounded">
                Kembali ke Home
            </Link>
        </div>
    )
}

export default NotFound