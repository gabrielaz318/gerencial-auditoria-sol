import { ElementType } from "react";
import { Icon, Link as ChakraLink, Text, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { ActiveLink } from "../ActiveLink";

interface NavLinkProps extends ChakraLinkProps {
    icon: ElementType;
    name: string;
    href: string;
}

export function NavLink({ icon, name, href, ...rest }: NavLinkProps) {
    return (
        <ActiveLink href={href} passHref>
            <ChakraLink display="flex" align="center" {...rest}>
                <Icon as={icon} fontSize="20" />
                <Text ml="4" fontWeight="medium">{name}</Text>
            </ChakraLink>
        </ActiveLink>
    )
}