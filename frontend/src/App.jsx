import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:4000", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Respuesta backend:", data);
      })
      .catch(err => {
        console.error("Error CORS o conexión:", err);
      });
  }, []);

  return (
    <div>
      <h1>Frontend funcionando</h1>
      <p>Revisa la consola del navegador</p>
    </div>
  );
}

export default App;
