'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Bell, ExternalLink, RefreshCw, Scale, Building2, Landmark } from 'lucide-react'

export default function PublicationsPage({ user }) {
  const [publications, setPublications] = useState([])
  const [searchOAB, setSearchOAB] = useState('')
  const [searchName, setSearchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const courts = [
    { id: 'trt6', name: 'TRT6 - Tribunal Regional do Trabalho', icon: Landmark, color: 'bg-blue-100 text-blue-700' },
    { id: 'tjpe', name: 'TJPE - Tribunal de Justiça de Pernambuco', icon: Scale, color: 'bg-green-100 text-green-700' },
    { id: 'jfpe', name: 'JFPE - Justiça Federal em Pernambuco', icon: Building2, color: 'bg-purple-100 text-purple-700' }
  ]

  const handleSearch = async () => {
    if (!searchOAB && !searchName) {
      toast.error('Informe o número da OAB ou nome do advogado')
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/publications/search?oab=${encodeURIComponent(searchOAB)}&name=${encodeURIComponent(searchName)}`)
      
      if (response.ok) {
        const data = await response.json()
        setPublications(data.publications || [])
        if (data.publications?.length === 0) {
          toast.info('Nenhuma publicação encontrada')
        } else {
          toast.success(`${data.publications.length} publicações encontradas`)
        }
      } else {
        throw new Error('Search failed')
      }
    } catch (error) {
      console.error('Error searching publications:', error)
      toast.error('Erro ao buscar publicações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getCourtInfo = (courtId) => {
    return courts.find(c => c.id === courtId) || courts[0]
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Buscar Publicações
          </CardTitle>
          <CardDescription>
            Pesquise publicações nos tribunais TRT6, TJPE e JFPE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>Número da OAB</Label>
              <Input
                placeholder="Ex: PE 12345"
                value={searchOAB}
                onChange={(e) => setSearchOAB(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Nome do Advogado</Label>
              <Input
                placeholder="Nome completo ou parcial"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courts Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courts.map((court) => {
          const Icon = court.icon
          return (
            <Card key={court.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${court.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{court.name}</p>
                  <p className="text-xs text-gray-500">API Pública PJe/e-SAJ</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Results */}
      {searched && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>{publications.length} publicações encontradas</CardDescription>
          </CardHeader>
          <CardContent>
            {publications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhuma publicação encontrada</p>
                <p className="text-sm text-gray-400">Tente com outros parâmetros de busca</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publications.map((pub, index) => {
                  const court = getCourtInfo(pub.court)
                  const Icon = court.icon
                  return (
                    <div key={index} className="p-4 rounded-lg border bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${court.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{pub.court?.toUpperCase()}</Badge>
                              <span className="text-sm text-gray-500">
                                {pub.date ? new Date(pub.date).toLocaleDateString('pt-BR') : 'Data não informada'}
                              </span>
                            </div>
                            <h4 className="font-medium mt-1">{pub.process_number || 'Número não informado'}</h4>
                            <p className="text-sm text-gray-600 mt-2">{pub.content}</p>
                          </div>
                        </div>
                        {pub.link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={pub.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ver
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {!searched && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Informe o número da OAB (ex: PE 12345) ou nome do advogado</li>
              <li>• O sistema buscará publicações nos tribunais TRT6, TJPE e JFPE</li>
              <li>• As publicações são obtidas através das APIs públicas do PJe e e-SAJ</li>
              <li>• Clique em "Ver" para acessar o documento original no tribunal</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
