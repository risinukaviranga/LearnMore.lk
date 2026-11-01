const OK: Record<string, string> = {
  created: "Record created successfully.",
  updated: "Changes saved successfully.",
  deleted: "Record deleted.",
  welcome: "Welcome to LearnMore.lk! Your account is ready.",
  loggedout: "You have been logged out.",
  added: "Added to your cart.",
  removed: "Removed from your cart.",
  paid: "Payment successful - your purchase is ready in My Library.",
  enrolled: "You are enrolled in this class.",
  unenrolled: "You have left this class.",
  checkedin: "Attendance recorded. Enjoy the class!",
};

const ERR: Record<string, string> = {
  forbidden: "You do not have permission to do that.",
  notfound: "That record could not be found.",
  "in-use": "This e-book has already been purchased by students, so it cannot be deleted.",
  owned: "You already own this e-book.",
  empty: "Your cart is empty.",
  method: "Please choose a payment method.",
  closed: "Check-in is only open from 15 minutes before the class until it ends.",
  past: "This class has already finished.",
  self: "You cannot change your own role.",
};

export default function Flash({ msg, err }: { msg?: string; err?: string }) {
  const ok = msg ? OK[msg] : undefined;
  const bad = err ? ERR[err] : undefined;
  if (!ok && !bad) return null;
  return <div className={ok ? "alert-ok" : "alert-error"}>{ok ?? bad}</div>;
}
