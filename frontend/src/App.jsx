import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="min-h-screen bg-green-500 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">
          Chào mừng anh em đến với đồ án kỳ SPRING 2026! 🎉🎉🎉🎉🎉🎉
          <br />
          Chúc anh em thành công!🎉🎉🎉🎉🎉🎉
        </h1>
      </div>
    </>
  );
}

export default App;
