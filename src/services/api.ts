const API = "http://localhost:3001/api";

export async function guardarParticipante(data: any) {
  const res = await fetch(`${API}/participantes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Error al guardar participante");
  }

  return res.json();
}