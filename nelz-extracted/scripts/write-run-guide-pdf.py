"""One-off guide PDF for running Nelz Local Much on Windows."""
from fpdf import FPDF

OUT = "/workspace/artifacts/Nelz-Local-Much-Run-Guide.pdf"
INK = (47, 43, 39)
PAPER = (246, 243, 238)
ACCENT = (159, 59, 47)
SOFT = (232, 226, 218)
MUTED = (110, 102, 94)


class Guide(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*PAPER)
        self.rect(0, 0, 210, 14, "F")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*MUTED)
        self.set_xy(16, 5)
        self.cell(120, 6, "Nelz Local Much  |  Windows run guide")
        self.set_xy(150, 5)
        self.cell(44, 6, f"Page {self.page_no()}", align="R")
        self.set_draw_color(*ACCENT)
        self.set_line_width(0.4)
        self.line(16, 13, 194, 13)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 6, "Updated 20 October 2026  |  This site is Node.js, not XAMPP / PHP.", align="C")

    def h1(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(*INK)
        self.multi_cell(0, 8, text)
        self.ln(1)

    def h2(self, text):
        self.ln(3)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*ACCENT)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def p(self, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(*INK)
        self.multi_cell(0, 5.6, text)
        self.ln(1.5)

    def bullet(self, text):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(*INK)
        x = self.get_x()
        self.cell(6, 5.6, "-")
        self.multi_cell(0, 5.6, text)
        self.set_x(x)

    def code_block(self, lines):
        self.ln(1)
        self.set_fill_color(47, 43, 39)
        self.set_text_color(246, 243, 238)
        self.set_font("Courier", "", 9)
        text = "\n".join(lines)
        self.multi_cell(0, 5, text, fill=True)
        self.ln(2)

    def callout(self, title, body):
        self.ln(1)
        y = self.get_y()
        self.set_fill_color(*SOFT)
        self.set_font("Helvetica", "", 10.5)
        # measure
        self.set_xy(20, y + 4)
        # draw after measuring height via a dry split
        lines = self.multi_cell(170, 5.2, body, dry_run=True, output="LINES")
        h = 10 + len(lines) * 5.2 + 4
        if y + h > 275:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*SOFT)
        self.rect(16, y, 178, h, "F")
        self.set_fill_color(*ACCENT)
        self.rect(16, y, 2.2, h, "F")
        self.set_xy(22, y + 3)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*ACCENT)
        self.cell(0, 6, title)
        self.set_xy(22, y + 9)
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(*INK)
        self.multi_cell(168, 5.2, body)
        self.set_y(y + h + 3)


pdf = Guide(format="A4")
pdf.set_auto_page_break(auto=True, margin=16)
pdf.set_margins(16, 18, 16)
pdf.add_page()

# Cover band
pdf.set_fill_color(*INK)
pdf.rect(0, 0, 210, 78, "F")
pdf.set_fill_color(*ACCENT)
pdf.rect(0, 78, 210, 3, "F")
pdf.set_xy(16, 18)
pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(232, 226, 218)
pdf.cell(0, 6, "NELZ LOCAL MUCH")
pdf.set_xy(16, 30)
pdf.set_font("Helvetica", "B", 22)
pdf.set_text_color(246, 243, 238)
pdf.multi_cell(170, 9, "Why it will not start,\nand how to run it on Windows")
pdf.set_xy(16, 62)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(232, 226, 218)
pdf.cell(0, 6, "Updated 20 October 2026")

pdf.set_y(92)
pdf.h1("The short answer")
pdf.p(
    "The website itself is fine. The install on your computer stopped halfway, so the program that starts the site (Vite) was never downloaded. That is why you see \"spawn vite ENOENT\". ENOENT means \"this file does not exist\"."
)
pdf.callout(
    "Do not use XAMPP to run this site",
    "Nelz Local Much is a Node.js app. Apache, MySQL and the htdocs folder are for PHP sites. You can keep the folder inside htdocs if you want, but you must not open it through XAMPP. You start it with Node, then open it in the browser at http://localhost:8080.",
)

pdf.h2("What each message means")
pdf.bullet("\"The system cannot find the path specified\" - the folder was not unzipped yet, or the name did not match. Later you did get into the folder, so this one is already solved.")
pdf.bullet("\"tarball data ... seems to be corrupted\" - npm started downloading packages and the files arrived broken. Usually a bad npm cache, antivirus, or a dropped internet connection.")
pdf.bullet("\"Exit handler never called\" - npm crashed on itself after those bad downloads. The install did not finish. This is an npm problem, not a problem in the shop code.")
pdf.bullet("\"failed to run vite: spawn vite ENOENT\" - you ran the site before install succeeded. Windows looked for vite and could not find it, because node_modules was never completed.")
pdf.bullet("Typing \"install Node 22\" does nothing. That sentence in the old note was an instruction, not a command.")

pdf.add_page()
pdf.h1("Step by step: get it running")
pdf.p("Do these in order. Wait for each one to finish before the next.")

pdf.h2("1. Install Node.js 22")
pdf.p("Open a browser and go to https://nodejs.org. Download the Windows installer for Node.js 22 (the LTS button is fine if it says 22). Run the installer and leave the default options ticked, including \"Add to PATH\".")
pdf.p("Close every old Command Prompt window. Open a new one and type:")
pdf.code_block(["node -v", "npm -v"])
pdf.p("You should see a version starting with v22, and an npm version number. If Windows says \"node is not recognized\", the installer did not add Node to PATH. Restart the computer and try again.")

pdf.h2("2. Stop XAMPP Tomcat")
pdf.p("Open the XAMPP Control Panel and Stop Apache and Tomcat if they are running. Tomcat also uses port 8080. If it is running, the shop cannot start on that port. You do not need MySQL for this site.")

pdf.h2("3. Go to the project folder")
pdf.p("The folder you open must contain package.json. If you unzipped and ended up with an extra folder inside, go into that inner folder.")
pdf.code_block(["cd C:\\xampp\\htdocs\\nelz-local-much", "dir package.json"])
pdf.p("If dir says \"File Not Found\", you are in the wrong folder. Look for package.json and cd into the folder that holds it.")

pdf.h2("4. Throw away the broken install")
pdf.p("These commands delete only the half-downloaded files. They do not delete your source code.")
pdf.code_block([
    "rmdir /s /q node_modules",
    "npm cache clean --force",
])
pdf.p("If Windows says node_modules does not exist, that is fine. Continue.")

pdf.h2("5. Install again, and wait")
pdf.code_block(["npm install"])
pdf.p("This can take several minutes. It is finished only when you see a line like \"added 300 packages\" and the prompt comes back, with no line that starts with \"npm error\".")
pdf.callout(
    "If the corrupted-tarball warning comes back",
    "Turn off VPN if you use one. Then run: rmdir /s /q %LOCALAPPDATA%\\npm-cache    and then npm install again. Windows Defender sometimes scans files while npm is writing them. If it keeps failing, pause real-time protection for ten minutes, run npm install once, then turn protection back on.",
)

pdf.add_page()
pdf.h2("6. Start the site")
pdf.p("Only do this after step 5 succeeded.")
pdf.code_block(["npm run dev"])
pdf.p("Leave that window open. When it says the server is ready, open a browser (Chrome or Edge) and go to:")
pdf.code_block(["http://localhost:8080"])
pdf.p("Do not close the black window while you are using the site. Closing it stops the site. To stop it on purpose, click that window and press Ctrl+C.")

pdf.h2("7. What you should see")
pdf.bullet("The shop home page: menu, search, cart, and checkout.")
pdf.bullet("A Staff link in the header. That is the only door into the kitchen.")
pdf.bullet("Create an account there. The first two people who open Kitchen become the two staff accounts. A third account is told the kitchen is full.")
pdf.bullet("No separate database install. The site creates its own local database the first time it runs.")

pdf.h1("Using the shop")
pdf.h2("Customers")
pdf.bullet("Browse the menu, filter by category, and search by dish name.")
pdf.bullet("Add items to the bag, then check out with a name and contact details.")
pdf.bullet("Prices and dishes come from the kitchen, so they change when staff edit them.")

pdf.h2("Staff (two accounts only)")
pdf.p("Click Staff, create an account with email and password, then open Kitchen. The kitchen has five panels:")
pdf.bullet("Overview - orders, revenue, dish count, and recent orders.")
pdf.bullet("Menu - add a dish, edit the name, description, price, category, and picture, or remove it. Hide a dish by marking it unavailable.")
pdf.bullet("Orders - move an order through pending, confirmed, completed, or cancelled.")
pdf.bullet("Look - change the shop name, upload a logo, and set three colours: ink (text), paper (background), and accent (the small red used on buttons). Changes show on the public site immediately.")
pdf.bullet("Activity - a log of who changed the menu, orders, and look.")
pdf.p("Sign out from the account button in the kitchen. Password changes are done from that same account menu after you are signed in.")

pdf.add_page()
pdf.h1("What was added in the updates")
pdf.bullet("A real shop, not a static page: menu, cart, and checkout are saved.")
pdf.bullet("A separate staff sign-in. Guests cannot open the kitchen.")
pdf.bullet("A hard limit of two staff seats.")
pdf.bullet("Kitchen tools to add, edit, and remove dishes, including pictures and descriptions.")
pdf.bullet("Order list and status changes.")
pdf.bullet("An activity log.")
pdf.bullet("A Look panel so an owner can rename the shop, replace the logo, and change ink, paper, and accent colours.")
pdf.bullet("Neutral paper-and-ink design with one deep red accent, the default accent being #9F3B2F.")
pdf.bullet("A local database that starts by itself, so you do not configure MySQL or XAMPP.")

pdf.h1("If it still will not start")
pdf.h2("npm install never finishes")
pdf.bullet("You are offline, or a firewall is blocking registry.npmjs.org. Connect and try again.")
pdf.bullet("Move the project out of XAMPP to a short path, then install there:")
pdf.code_block([
    "mkdir C:\\nelz",
    "xcopy C:\\xampp\\htdocs\\nelz-local-much C:\\nelz\\nelz-local-much /E /I",
    "cd C:\\nelz\\nelz-local-much",
    "npm install",
])
pdf.bullet("Do not run npm install and npm run dev at the same time.")

pdf.h2("npm run dev says the port is in use")
pdf.p("Something else is using port 8080, almost always XAMPP Tomcat. Stop Tomcat in the XAMPP Control Panel, then run npm run dev again.")

pdf.h2("The page opens but the menu is empty or Kitchen says checking access")
pdf.p("Leave the command window open and refresh the browser. The first start builds the local database and can take a little longer. If the command window shows a red error, copy that error. The old \"tarball corrupted\" text is not the error to send - that one only happens during npm install.")

pdf.h2("Commands you should not type")
pdf.bullet("install Node 22")
pdf.bullet("php or anything inside the XAMPP shell as the way to start this site")
pdf.bullet("npm run dev before npm install has finished without an npm error")

pdf.ln(2)
pdf.callout(
    "Success looks like this",
    "node -v prints v22 or newer. npm install ends with \"added ... packages\" and no npm error. npm run dev stays running. The browser at http://localhost:8080 shows the Nelz Local Much menu.",
)

pdf.output(OUT)
print(OUT)
