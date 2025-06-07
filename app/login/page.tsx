import { Suspense } from "react";
import LoginComponent from "../components/Login";
import MainLayout from "../components/MainLayout";

export default function LoginPage() {
  return (
    <Suspense>
      <MainLayout>
        <LoginComponent />
      </MainLayout>
    </Suspense>
  );
}
