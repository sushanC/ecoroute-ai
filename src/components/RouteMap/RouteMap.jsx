import { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const createIcon = (url) =>
  new L.Icon({
    iconUrl: url,
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

const greenBinIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
)

const yellowBinIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png'
)

const orangeBinIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png'
)

const redBinIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
)

const userIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png'
)

const truckIcon = createIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
)

export default function RouteMap({
  bins = [],
  requests = [],
  trucks = []
}) {
  const center = [12.9735, 77.6075]

  const [routes, setRoutes] = useState([])

  useEffect(() => {
    const generateRoutes = async () => {
      try {
        if (!trucks.length) {
          setRoutes([])
          return
        }

        const priorityMap = {
          High: 1,
          Medium: 2,
          Low: 3
        }

        const priorityBins = bins
          .filter(
            (bin) =>
              bin.status === 'OVERFLOW' ||
              bin.status === 'HIGH'
          )
          .map((bin) => ({
            lat: Number(bin.lat),
            lng: Number(bin.lng),
            weight: 15
          }))

        const sortedRequests = [...requests]
          .filter(
            (req) =>
              req.status !== 'completed'
          )
          .sort(
            (a, b) =>
              (priorityMap[a.priority] || 99) -
              (priorityMap[b.priority] || 99)
          )
          .map((req) => ({
            lat: Number(req.lat),
            lng: Number(req.lng),
            weight:
              Number(req.wasteAmount) || 10
          }))

        const allStops = [
          ...priorityBins,
          ...sortedRequests
        ]

        const routeResults = []

        const stopsPerTruck = Math.ceil(
          allStops.length / trucks.length
        )

        for (let i = 0; i < trucks.length; i++) {
          const truck = trucks[i]

          const assignedStops = allStops.slice(
            i * stopsPerTruck,
            (i + 1) * stopsPerTruck
          )

          if (!assignedStops.length) continue

          const coords = [
            [truck.lng, truck.lat],
            ...assignedStops.map((stop) => [
              stop.lng,
              stop.lat
            ])
          ]
            .map((p) => `${p[0]},${p[1]}`)
            .join(';')

          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
          )

          const data = await response.json()

          if (data.routes?.[0]) {
            const polyline =
              data.routes[0].geometry.coordinates.map(
                (point) => [
                  point[1],
                  point[0]
                ]
              )

            routeResults.push(polyline)
          }
        }

        setRoutes(routeResults)
      } catch (error) {
        console.error(
          'Route generation failed:',
          error
        )
      }
    }

    generateRoutes()
  }, [bins, requests, trucks])

  const getBinIcon = (status) => {
    switch (status) {
      case 'OVERFLOW':
        return redBinIcon
      case 'HIGH':
        return orangeBinIcon
      case 'MEDIUM':
        return yellowBinIcon
      default:
        return greenBinIcon
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '560px',
        borderRadius: '18px',
        overflow: 'hidden'
      }}
    >
      <MapContainer
        center={center}
        zoom={15}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Smart Bins */}
        {bins.map((bin) => (
          <Marker
            key={bin._id || bin.binId}
            position={[
              Number(bin.lat),
              Number(bin.lng)
            ]}
            icon={getBinIcon(bin.status)}
          >
            <Popup>
              <strong>{bin.binId}</strong>
              <br />
              {bin.location}
              <br />
              Fill: {bin.fillLevel}%
              <br />
              Status: {bin.status}
            </Popup>
          </Marker>
        ))}

        {/* Requests */}
        {requests.map((req) => (
          <Marker
            key={req._id}
            position={[
              Number(req.lat),
              Number(req.lng)
            ]}
            icon={userIcon}
          >
            <Popup>
              <strong>{req.name}</strong>
              <br />
              {req.location}
              <br />
              {req.wasteType} - {req.priority}
            </Popup>
          </Marker>
        ))}

        {/* Trucks */}
        {trucks.map((truck) => (
          <Marker
            key={truck._id || truck.truckId}
            position={[
              Number(truck.lat),
              Number(truck.lng)
            ]}
            icon={truckIcon}
          >
            <Popup>
              <strong>{truck.truckId}</strong>
              <br />
              Capacity: {truck.capacity}kg
              <br />
              Load: {truck.currentLoad}kg
            </Popup>
          </Marker>
        ))}

        {/* Routes */}
        {routes.map((route, index) => (
          <Polyline
            key={index}
            positions={route}
            color={
              ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][
                index % 4
              ]
            }
            weight={5}
            opacity={0.9}
          />
        ))}
      </MapContainer>
    </div>
  )
}