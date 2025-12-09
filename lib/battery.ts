import { useState, useEffect } from 'react';

export const useBatteryStatus = () => {
    const [isLowBattery, setIsLowBattery] = useState(false);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !('getBattery' in navigator)) return;

        (navigator as any).getBattery().then((battery: any) => {
            const checkBattery = () => {
                // Low battery = below 20% and not charging
                setIsLowBattery(battery.level < 0.2 && !battery.charging);
            };

            checkBattery();
            battery.addEventListener('levelchange', checkBattery);
            battery.addEventListener('chargingchange', checkBattery);

            return () => {
                battery.removeEventListener('levelchange', checkBattery);
                battery.removeEventListener('chargingchange', checkBattery);
            };
        });
    }, []);

    return isLowBattery;
};
