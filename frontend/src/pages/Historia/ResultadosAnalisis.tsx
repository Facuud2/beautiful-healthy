import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResultadosAnalisis = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/historia", { replace: true });
  }, [navigate]);

  return null;
};

export default ResultadosAnalisis;
