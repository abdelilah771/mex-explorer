import MultiStepRegisterForm from "@/components/auth/MultiStepRegisterForm";
import Image from "next/legacy/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information below to create your account
            </p>
          </div>
          <MultiStepRegisterForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/marrakech-hero.jpg"
          alt="Image of Marrakech"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
