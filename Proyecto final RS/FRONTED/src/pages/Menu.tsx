// ... (mismo código de antes en la parte de arriba)
// Buscá la parte de la Card de productos y asegurate de que tenga esto:

<Card key={p.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-md bg-white group">
  <div className="h-48 overflow-hidden">
    <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} />
  </div>
  <CardHeader className="pb-1">
    <CardTitle className="uppercase font-black text-sm italic">{p.nombre}</CardTitle>
    {/* AQUÍ AGREGAMOS LA DESCRIPCIÓN */}
    {p.descripcion && (
      <p className="text-[11px] text-slate-400 font-bold italic leading-tight mt-1 line-clamp-2">
        {p.descripcion}
      </p>
    )}
  </CardHeader>
  <CardContent>
     <p className="text-2xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
  </CardContent>
  <CardFooter>
    <Button className="w-full bg-slate-900 h-12 font-black rounded-2xl" onClick={() => agregarAlCarrito(p)}>
      + AGREGAR
    </Button>
  </CardFooter>
</Card>

// ... (resto del código igual)
