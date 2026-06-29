import { NavLink, Outlet } from "react-router-dom";


export default function Layout(){
    const navItems = [
        { to: "/", label: "Dashboard" },
        { to: "/upload", label: "New Entry" },
        { to: "/filter", label: "Filter" },
    ];

     return (
        <div className="flex min-h-screen bg-paper">
        <aside className="w-56 border-r border-rule px-6 py-10 flex flex-col gap-1">
            <h2 className="font-display text-xl mb-8">Budgeting App</h2>

            {navItems.map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                `py-2 px-2 text-sm rounded ${
                    isActive ? "bg-ink text-paper" : "text-ink hover:bg-rule/40"
                }`
                }
            >
                {item.label}
            </NavLink>
            ))}
        </aside>

        <main className="flex-1">
            <Outlet />
        </main>
        </div>
    );

}