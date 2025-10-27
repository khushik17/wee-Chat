import React from "react";
import { SignUp } from "@clerk/clerk-react";
import "../styles/SignUpPage.css";

export default function SignUpPage() {
  const appearanceOptions = {
    layout: {
      socialButtonsVariant: "iconButton",
      socialButtonsPlacement: "top",
      privacyPageUrl: "https://clerk.dev/privacy",
      termsPageUrl: "https://clerk.dev/terms",
    },
    variables: {
      colorPrimary: "#6366f1",
      colorBackground: "rgba(30, 41, 59, 0.95)",
      colorText: "#ffffff",
      colorInputText: "#ffffff",
      colorInputBackground: "rgba(255, 255, 255, 0.08)",
      colorInputBorder: "rgba(99, 102, 241, 0.3)",
      borderRadius: "12px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: "0.9rem",
    },
    elements: {
      rootBox: {
        backgroundColor: "transparent",
        width: "100%",
      },
      card: {
        backgroundColor: "rgba(30, 41, 59, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)",
        padding: "1.75rem",
        margin: "0 auto",
      },
      headerTitle: {
        color: "#ffffff",
        fontSize: "1.5rem",
        fontWeight: "700",
        marginBottom: "0.25rem",
      },
      headerSubtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "0.875rem",
        marginBottom: "1rem",
      },
      socialButtonsBlockButton: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        color: "#ffffff",
        transition: "all 0.3s ease",
        padding: "0.625rem",
        fontSize: "0.875rem",
        "&:hover": {
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 0.5)",
          transform: "translateY(-2px)",
        },
      },
      formButtonPrimary: {
        backgroundColor: "#6366f1",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        fontWeight: "600",
        fontSize: "0.95rem",
        padding: "0.75rem",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          transform: "translateY(-2px)",
          boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)",
        },
      },
      formFieldInput: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(99, 102, 241, 0.3)",
        color: "#ffffff",
        fontSize: "0.875rem",
        padding: "0.625rem 0.875rem",
        transition: "all 0.3s ease",
        "&:focus": {
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          borderColor: "#6366f1",
          boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
        },
        "&::placeholder": {
          color: "rgba(255, 255, 255, 0.4)",
        },
      },
      formFieldLabel: {
        color: "rgba(255, 255, 255, 0.9)",
        fontSize: "0.8rem",
        fontWeight: "500",
        marginBottom: "0.35rem",
      },
      formFieldRow: {
        marginBottom: "0.875rem",
      },
      dividerLine: {
        backgroundColor: "rgba(99, 102, 241, 0.2)",
      },
      dividerText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "0.8rem",
      },
      footerActionLink: {
        color: "#6366f1",
        fontWeight: "600",
        fontSize: "0.875rem",
        "&:hover": {
          color: "#8b5cf6",
        },
      },
      footer: {
        marginTop: "1rem",
      },
      identityPreviewText: {
        color: "rgba(255, 255, 255, 0.8)",
      },
      formFieldSuccessText: {
        color: "#10b981",
        fontSize: "0.8rem",
      },
      formFieldErrorText: {
        color: "#ef4444",
        fontSize: "0.8rem",
      },
    },
  };

  return (
    <div className="signup-container">
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="signup-wrapper">
        <SignUp
          path="/sign-up"
          routing="path"
          forceRedirectUrl="/profile"
          appearance={appearanceOptions}
        />
      </div>
    </div>
  );
}