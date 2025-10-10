import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
  expectedDate?: string
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon,
  expectedDate,
}: PlaceholderPageProps) {
  return (
    <div className="container mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-xl" />
                <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 rounded-full">
                  <Icon className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">
                Coming Soon
              </Badge>

              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {title}
              </CardTitle>

              <CardDescription className="text-lg text-muted-foreground">
                {description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {expectedDate && (
              <p className="text-sm text-muted-foreground">
                Expected Launch: <span className="font-semibold text-foreground">{expectedDate}</span>
              </p>
            )}

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                This page is currently under development. We are working hard to bring you this feature soon!
              </p>

              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
