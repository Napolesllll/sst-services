import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center justify-center mb-6">
      <Image
        src="/logo.png" // asegura que el archivo esté en /public/logo.png
        width={90} // tamaño recomendado
        height={90}
        alt="Logo"
        className="rounded-lg"
      />
    </div>
  );
}
