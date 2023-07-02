import { ReactNode, useRef } from "react";
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Input, useDisclosure } from "@chakra-ui/react"

interface IDrawerRight {
    children: ReactNode;
    title: string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export function DrawerRight({ title, onOpen, isOpen, onClose, children }: IDrawerRight) {
    const btnRef = useRef(null);
  
    return (
        <Drawer
            isOpen={isOpen}
            placement='right'
            onClose={onClose}
            finalFocusRef={btnRef}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>{title}</DrawerHeader>
    
                {children}
            </DrawerContent>
        </Drawer>
    )
  }