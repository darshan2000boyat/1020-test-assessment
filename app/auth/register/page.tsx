"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User
} from "lucide-react";
import { User as UserType } from "@/types/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Validation schema for Strapi registration
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: Yup.string().
    email("Invalid email").
    required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function StrapiRegisterFormik() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"

  const handleSubmit = async (values: UserType, { setSubmitting, resetForm }: { setSubmitting: (val: boolean) => void; resetForm: () => void; }) => {
    setErrorMsg("");

    try {
      const res = await axios.post(
        `${STRAPI_URL}/api/auth/local/register`,
        values
      );

      console.log(values, res)

      setUser(res.data.user);
      setSuccess(true);
      router.push("/login");
      resetForm();

      console.log("Registration successful:", {
        user: res.data.user,
        jwt: res.data.jwt
      });
    } catch (err: { message: string } | unknown) {
      const msg =
        "Registration failed. Please try again.";
      console.error(err)
      setErrorMsg(msg);
    }

    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register an Account</h1>
          <p className="text-gray-600 mt-2">Create a new Strapi user</p>
        </div>

        {success && user && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              Registration successful! You can now log in.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{errorMsg}</div>
          </div>
        )}


        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <Field
                    name="username"
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 placeholder:text-black/30 text-black border rounded-lg outline-none transition 
                      ${errors.username && touched.username
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    placeholder="Enter username"
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <Field
                    name="email"
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 placeholder:text-black/30 text-black border rounded-lg outline-none transition 
                      ${errors.email && touched.email
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    placeholder="Enter email"
                  />
                </div>

                {errors.email && touched.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-12 py-3 placeholder:text-black/30 text-black border rounded-lg outline-none transition 
                      ${errors.password && touched.password
                        ? "border-red-500 focus:ring-red-300"
                        : "border-gray-300 focus:ring-indigo-500"
                      }`}
                    placeholder="Enter password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                {errors.password && touched.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link href="/auth/login">
              <span className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                Login
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
