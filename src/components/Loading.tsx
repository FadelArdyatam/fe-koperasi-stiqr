
const Loading = () => {
    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-orange-500"></div>
        </div>
    )
}

export default Loading