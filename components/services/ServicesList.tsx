"use client";

import ServiceCard from "./ServiceCard";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
};

export default function ServicesList({
  services,
}: {
  services: Service[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          id={service.id}
          name={service.name}
          description={service.description}
          price={service.price}
          unit={service.unit}
        />
      ))}
    </div>
  );
}