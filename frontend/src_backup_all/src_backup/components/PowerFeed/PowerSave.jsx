import React from "react";

export default function PowerSave({ postContent }) {
  const handleSave = () => {
    console.log("Saved:", postContent);
  };

  return <button onClick={handleSave}>Save</button>;
}


