// import { useContext } from "react";

// import {
//   AuthContext,
// } from "../context/AuthContext";

// export function useAuth() {
//   const context =
//     useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth must be used inside AuthProvider.",
//     );
//   }

//   return context;
// }


// import { useContext } from "react";

// import { AuthContext } from "../context/authContext";

// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }

//   return context;
// };


import { useContext } from "react";

import { AuthContext } from "../context/authContextStore.js";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};