import { Stack, } from "@chakra-ui/react";
import { NavLink } from "./NavLink";
import { NavSection } from "./NavSection";
import { RiDashboardLine, RiListUnordered } from "react-icons/ri";
import { BiMailSend } from "react-icons/bi";
import { HiOutlineTicket } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { FiUsers, FiSliders } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

export function SidebarNav() {
    const { user } = useAuth();

    return (
        <Stack spacing="6" align="flex-start" p={4}>
            <NavSection title="GERAL">
                <NavLink href="/records" icon={RiListUnordered} name="Registros" />
            </NavSection>
            
            <NavSection title="CONFIGURAÇÕES">
                <NavLink href="/parameters" icon={FiSliders} name="Parâmetros dos registros" />
            </NavSection>
        
            <NavSection title="ADMINISTRADOR">
                <NavLink href="/users" icon={FiUsers} name="Usuários" />
            </NavSection>
        </Stack>
    )
}