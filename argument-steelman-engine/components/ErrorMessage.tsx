export default function ErrorMessage({ message }: { message: string }) {
  return <p role="alert" style={{ marginTop: 20, borderLeft: "4px solid var(--red)", background: "var(--card)", padding: "10px 14px", color: "var(--red)" }}>{message}</p>;
}
