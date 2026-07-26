import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ConcentOfPersonalData() {
  const navigate = useNavigate();

  useEffect(() => {
    const backButton = window.Telegram?.WebApp.BackButton;

    const goBack = () => navigate(-1);

    backButton.show();
    backButton.onClick(goBack);

    return () => {
      backButton.offClick(goBack);
      backButton.hide();
    };
  }, [navigate]);

  return (
    <iframe
      src="/Согласие_на_обработку_персональных_данных.pdf"
      width="100%"
      height="800"
      title="Согласие на обработку персональных данных"
    />
  );
}

export default ConcentOfPersonalData;