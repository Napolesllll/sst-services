"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Image from "next/image";
import Logo from "./Logo";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card variant="cyber" hover={false} className="backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center mb-8"
          >
            {/* 🔥 Aquí va tu logo SIN tocar nada más */}
            <Logo />

            <h1 className="text-3xl font-bold text-gradient mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-400">Accede a tu cuenta</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              name="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-danger/20 border border-danger text-danger text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="secondary"
              fullWidth
              loading={loading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-secondary-400 hover:text-secondary-300 font-semibold transition-colors"
              >
                Regístrate
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
