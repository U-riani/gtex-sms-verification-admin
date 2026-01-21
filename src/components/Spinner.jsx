export default function Spinner({ size = 40 }) {
  return (
    <div className="w-full h-full flex items-center justify-center py-12">
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
