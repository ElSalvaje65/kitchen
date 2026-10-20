"""Simple customer and staff user guide."""
from fpdf import FPDF

OUT = "/workspace/artifacts/Nelz-Local-Much-User-Guide.pdf"
INK = (47, 43, 39)
ACCENT = (159, 59, 47)
SOFT = (232, 226, 218)
MUTED = (110, 102, 94)


class Guide(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 6, "Nelz Local Much  |  Simple user guide", align="C")

    def h1(self, text):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(*INK)
        self.multi_cell(0, 8, text)
        self.ln(1)

    def h2(self, text):
        self.ln(3)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*ACCENT)
        self.multi_cell(0, 7, text)
        self.ln(1)

    def p(self, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(*INK)
        self.multi_cell(0, 5.6, text)
        self.ln(1.4)

    def step(self, n, title, body):
        self.set_fill_color(*SOFT)
        y = self.get_y()
        if y > 250:
            self.add_page()
            y = self.get_y()
        self.set_font("Helvetica", "", 11)
        lines = self.multi_cell(158, 5.4, body, dry_run=True, output="LINES")
        h = 8 + 6 + len(lines) * 5.4 + 4
        self.set_fill_color(*SOFT)
        self.rect(16, y, 178, h, "F")
        self.set_fill_color(*ACCENT)
        self.rect(16, y, 2, h, "F")
        self.set_xy(24, y + 3)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*INK)
        self.cell(0, 6, f"{n}.  {title}")
        self.set_xy(24, y + 10)
        self.set_font("Helvetica", "", 11)
        self.multi_cell(164, 5.4, body)
        self.set_y(y + h + 3)


pdf = Guide(format="A4")
pdf.set_auto_page_break(auto=True, margin=16)
pdf.set_margins(16, 16, 16)
pdf.add_page()

pdf.set_fill_color(*INK)
pdf.rect(0, 0, 210, 42, "F")
pdf.set_fill_color(*ACCENT)
pdf.rect(0, 42, 210, 2.5, "F")
pdf.set_xy(16, 12)
pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(232, 226, 218)
pdf.cell(0, 6, "NELZ LOCAL MUCH")
pdf.set_xy(16, 22)
pdf.set_font("Helvetica", "B", 20)
pdf.set_text_color(246, 243, 238)
pdf.cell(0, 10, "Simple user guide")

pdf.set_y(54)
pdf.p("This guide is for two kinds of people: anyone ordering food, and the two staff accounts that run the kitchen.")

pdf.h2("Order food")
pdf.step("1", "Open the menu", "The home page lists what is available. Use the category chips, or the search icon, to find a dish.")
pdf.step("2", "Add it to the bag", "Tap the add button on a dish. A number appears on the bag icon in the top bar.")
pdf.step("3", "Check the bag", "Tap the bag. Change the quantity or remove a dish before you continue.")
pdf.step("4", "Place the order", "Tap checkout. Enter your name and phone. Email and notes are optional. Use notes for allergies or a pickup time.")
pdf.step("5", "Wait for the kitchen", "You will see a message that the order was received. Staff can then mark it confirmed, completed, or cancelled.")

pdf.h2("You do not need an account to order")
pdf.p("Anyone can browse and place an order. Sign-in is only for staff. Customers cannot open the kitchen.")

pdf.add_page()
pdf.h1("Staff")
pdf.p("Only two accounts can manage the shop. Everyone else can still order.")
pdf.step("1", "Tap Staff", "Staff is in the top bar. It opens a separate sign-in page.")
pdf.step("2", "Create an account", "Choose create account, then enter a name, email, and password. Next time, sign in with that same email and password.")
pdf.step("3", "Open Kitchen", "The first two accounts that open Kitchen become the managers. A third account is told the kitchen is full.")
pdf.step("4", "Sign out", "Use Sign out next to your name. Signing out does not delete the account.")

pdf.h2("What the kitchen panels do")
pdf.step("Overview", "Today's picture", "See the number of orders, the total, how many dishes are on the menu, and the newest orders.")
pdf.step("Menu", "The dishes", "Add a dish. Change its name, description, price, category, and picture. Remove a dish, or mark it unavailable so customers no longer see it.")
pdf.step("Orders", "The queue", "Move an order from pending to confirmed, completed, or cancelled.")
pdf.step("Look", "The shop's face", "Change the shop name, upload a logo, and choose the text colour, the background colour, and the small accent colour. The public site updates straight away.")
pdf.step("Activity", "The log", "Read a short list of who changed the menu, the orders, or the look.")

pdf.ln(2)
pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(*INK)
pdf.multi_cell(0, 5.6, "That is the whole app. Customers order from the menu. Two staff accounts run the kitchen.")

pdf.output(OUT)
print(OUT)
