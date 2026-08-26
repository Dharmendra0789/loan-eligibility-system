import "../src/App.css";

export const metadata = {
  title: "MoneyBeing Loan Eligibility",
  description: "Loan Eligibility & Lead Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}