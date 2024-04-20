import "../src/app/globals.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Link from "next/link";
import { supabase } from "../src/utils/supabaseClient";
export default function AuthComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");

  const [roleStatus, setRoleStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const validatePhoneNumber = (phone) => {
    const format = /^\+\d{1,2} \(\d{3}\) \d{3}-\d{4}$/;
    return format.test(phone);
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneValid(validatePhoneNumber(value)); // Validate and update validity state
  };

  const routeToSignIn = () => {
    router.push("/signin");
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if the email is a valid UC Davis email before attempting to sign up

    const { user, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          fullname: fullname,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      console.log(signUpError.message);
    } else {
      // Optionally, handle any post-signup logic here
      console.log(
        "Signup successful, check your email for the verification link."
      );
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/*
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
            alt="Your Company"
          />
          */}
          <h2 className="mt-4 text-center text-2xl leading-9 tracking-tight text-gray-900">
            Sign up for an account
          </h2>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-8 sm:rounded-lg sm:px-12">
            <form className="space-y-6" action="#" onSubmit={handleSignUp}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="fullname"
                    name="fullname"
                    type="fullname"
                    autoComplete="fullname"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="appearance-none block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>{" "}
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm  leading-6 text-white  hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span
              onClick={routeToSignIn}
              className=" text-blue-600 hover:text-blue-500"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
