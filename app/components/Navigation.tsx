import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Navigation() {
  return (
    <nav className="mb-6">
      <ul className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
        <li className="w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Today's Attendance</Link>
          </Button>
        </li>
        <li className="w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full">
            <Link href="/previous-attendance">Previous Attendance</Link>
          </Button>
        </li>
      </ul>
    </nav>
  )
}

