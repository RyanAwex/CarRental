import { Plane, Ship, Store, TrainFront } from "lucide-react";

export const PICKUP_LOCATIONS = [
  {
    id: "agency-downtown",
    name: "Downtown Rental Agency",
    Icon: Store,
    type: "agency",
  },
  {
    id: "tng-airport",
    name: "Ibn Battouta Airport (Tangier)",
    Icon: Plane,
    type: "airport",
  },
  {
    id: "casa-airport",
    name: "Mohammed V International Airport (Casablanca)",
    Icon: Plane,
    type: "airport",
  },
  {
    id: "rak-airport",
    name: "Marrakech-Menara Airport (Marrakech)",
    Icon: Plane,
    type: "airport",
  },
  {
    id: "rabat-airport",
    name: "Rabat-Salé Airport (Rabat-Salé)",
    Icon: Plane,
    type: "airport",
  },
  {
    id: "tet-airport",
    name: "Saniat R'mel Airport (Tetouan)",
    Icon: Plane,
    type: "airport",
  },
  {
    id: "tng-train",
    name: "Tangier Ville Train Station",
    Icon: TrainFront,
    type: "train",
  },
  {
    id: "casa-train",
    name: "Casablanca Voyageurs Train Station",
    Icon: TrainFront,
    type: "train",
  },
  {
    id: "rak-train",
    name: "Marrakech Train Station",
    Icon: TrainFront,
    type: "train",
  },
  {
    id: "rabat-train",
    name: "Rabat Agdal Train Station",
    Icon: TrainFront,
    type: "train",
  },
  {
    id: "tng-port",
    name: "Tangier Med Port (Tangier)",
    Icon: Ship,
    type: "port",
  },
];
