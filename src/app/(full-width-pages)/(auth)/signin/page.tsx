import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WMS Logistics Portal | Sign In",
  description: "Sign In to WarehousePro Logistics Portal",
};

export default function SignIn() {
  return <SignInForm />;
}
