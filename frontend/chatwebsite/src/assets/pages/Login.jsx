import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <SignIn
      path="/sign-in"                 // Route jahan SignIn dikhega
      routing="path"                  // Required
      forceRedirectUrl="/profile"     // Login ke baad redirect (new prop)
    />
  );
}
