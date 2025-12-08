"use client";
import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { setCookie } from "cookies-next";

interface LoginValues {
  identifier: string;
  password: string;
}


const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required("Email or username is required"),
  password: Yup.string().required("Password is required"),
});

export default function StrapiLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  const handleSubmit = async (values: LoginValues, { setSubmitting }: { setSubmitting: (val: boolean) => void; }) => {
    setError("");
    try {
      await axios.post("/api/auth/login", values, { withCredentials: true });
      // const response = await axios.post("/api/auth/login", values, { withCredentials: true });
;

      // const { jwt, user } = response.data;


      // setCookie("jwt", jwt, {
      //   maxAge: 60 * 60 * 24 * 7,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      //   path: "/",
      // });

      // const { id, documentId, ...cleanedUser } = user;

      // setCookie("user", JSON.stringify(cleanedUser), {
      //   maxAge: 60 * 60 * 24 * 7,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      //   path: "/",
      // });


      router.push("/timesheets");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error?.message ||
          "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Login to Strapi</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Formik Form */}
        <Formik
          initialValues={{ identifier: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-5">
              {/* Identifier */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="identifier"
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 placeholder:text-black/30 text-black border rounded-lg outline-none transition-all ${errors.identifier && touched.identifier
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    placeholder="Enter email or username"
                  />
                </div>
                {errors.identifier && touched.identifier && (
                  <p className="text-xs text-red-600 mt-1">{errors.identifier}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-3 placeholder:text-black/30 text-black border rounded-lg outline-none transition-all ${errors.password && touched.password
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Register link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don’t have an account?{" "}
            <Link href="/auth/register">
              <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                Register
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
