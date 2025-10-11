import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import {headsupCorp} from "../../public/headsupCorp.png"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
              <Image
                src="/headsupLogoPNG.png"
                alt="The Last Mile"
                width={69}
                height={69}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-semibold">The Last Mile</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/headsupCorp.png"
            alt="Headsup Corporation"
            width={400}
            height={400}
            className="object-contain opacity-95"
          />
        </div>
      </div>
    </div>
  )
}