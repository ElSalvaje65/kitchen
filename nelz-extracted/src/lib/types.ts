export const CATEGORIES = ["mains", "starters", "sides", "desserts", "drinks"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: number;
  name: string;
  category: Category;
  description: string;
  price: number;
  image: string;
  available: boolean;
};

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type OrderItem = {
  productId: number | null;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type ActivityItem = {
  id: number;
  message: string;
  actor: string;
  createdAt: string;
};

export type StaffSeat = {
  userId: string;
  displayName: string;
  createdAt: string;
};

export type StaffStatus = {
  isStaff: boolean;
  seatsTaken: number;
  seatsMax: number;
  seats: StaffSeat[];
};
