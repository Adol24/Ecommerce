"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Image as ImageIcon, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { insforge } from "@/lib/insforge"

interface BannerItem {
  id: string
  badge: string
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  imageUrl: string
  priority: number
  sortOrder: number
  isActive: boolean
  startAt?: string | null
  endAt?: string | null
}

function transformBannerFromDB(item: Record<string, unknown>): BannerItem {
  return {
    id: item.id as string,
    badge: item.badge as string || "",
    title: item.title as string || "",
    subtitle: item.subtitle as string || "",
    ctaText: item.cta_text as string || "",
    ctaHref: item.cta_href as string || "",
    imageUrl: item.image_url as string || "",
    priority: (item.priority as number) || 1,
    sortOrder: (item.sort_order as number) || 0,
    isActive: item.is_active as boolean || false,
    startAt: item.start_at as string | null,
    endAt: item.end_at as string | null,
  }
}

function getScheduleStatus(banner: BannerItem) {
  const now = new Date()
  const start = banner.startAt ? new Date(banner.startAt) : null
  const end = banner.endAt ? new Date(banner.endAt) : null

  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return "PROGRAMADO"
  }
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
    return "VENCIDO"
  }
  return "VIGENTE"
}

function formatSchedule(banner: BannerItem) {
  const start = banner.startAt ? new Date(banner.startAt) : null
  const end = banner.endAt ? new Date(banner.endAt) : null
  const startText = start && !Number.isNaN(start.getTime())
    ? start.toLocaleString("es-MX")
    : "Inmediato"
  const endText = end && !Number.isNaN(end.getTime())
    ? end.toLocaleString("es-MX")
    : "Sin fin"
  return `${startText} -> ${endText}`
}

function BannersSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vista</TableHead>
          <TableHead>Titulo</TableHead>
          <TableHead>CTA</TableHead>
          <TableHead>Prioridad / Orden</TableHead>
          <TableHead>Programacion</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[70px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3].map((i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-14 w-24 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-36" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error: fetchError } = await insforge.database
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })

      if (fetchError) {
        setError(fetchError.message || "Error al cargar banners")
        return
      }

      setError(null)
      const transformed = (data || []).map(transformBannerFromDB)
      setBanners(transformed)
    } catch {
      setError("Error de conexion al cargar banners")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchBanners()
  }, [fetchBanners])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error: deleteError } = await insforge.database
        .from("banners")
        .delete()
        .eq("id", deleteId)

      if (!deleteError) {
        setBanners((prev) => prev.filter((b) => b.id !== deleteId))
      }
    } catch {
      console.error("Error deleting banner")
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const activeCount = banners.filter((b) => b.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-muted-foreground">
            Administra los textos e imagenes del hero principal de la tienda
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Banner
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{banners.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{activeCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactivos</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{banners.length - activeCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <BannersSkeleton />
          ) : error ? (
            <div className="p-6 text-sm">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vista</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>CTA</TableHead>
                  <TableHead>Prioridad / Orden</TableHead>
                  <TableHead>Programacion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[70px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No hay banners aun
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative h-14 w-24 overflow-hidden rounded-md border bg-muted">
                          {banner.imageUrl ? (
                            <Image
                              src={banner.imageUrl}
                              alt={banner.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.subtitle && (
                            <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{banner.ctaText}</p>
                          <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                            {banner.ctaHref}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">P{banner.priority}</p>
                          <p className="text-xs text-muted-foreground">Orden {banner.sortOrder}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium">
                            {getScheduleStatus(banner)}
                          </p>
                          <p className="max-w-[240px] truncate text-muted-foreground">
                            {formatSchedule(banner)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {banner.isActive ? (
                          <Badge className="bg-green-600">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/banners/${banner.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(banner.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar banner</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El banner dejara de mostrarse en la tienda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
