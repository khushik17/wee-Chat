import React from "react";
import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <SignUp
      path="/sign-up"                 // Route jahan SignUp dikhega
      routing="path"                  // Required
      forceRedirectUrl="/profile"     // Signup ke baad redirect (new prop)
    />
  );
}
