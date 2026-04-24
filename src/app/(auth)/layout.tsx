import dynamic from 'next/dynamic'

const VantaBackground = dynamic(() => import('@/components/ui/VantaBackground'), {
  ssr: false,
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VantaBackground />
      {children}
    </>
  )
}
