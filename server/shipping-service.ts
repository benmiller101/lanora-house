import { db } from "./db";
import { orders, orderItems, products } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface ShippingCalculation {
  method: string;
  cost: number;
  estimatedDays: string;
  trackingAvailable: boolean;
}

export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

export class ShippingService {
  /**
   * Calculate available shipping methods based on destination and items
   */
  static calculateShippingOptions(
    items: Array<{ weight?: number; dimensions?: string; quantity: number }>,
    destination: ShippingAddress
  ): ShippingCalculation[] {
    const totalWeight = this.calculateTotalWeight(items);
    const hasLargeItems = this.hasLargeItems(items);
    const isUK = this.isUKAddress(destination);
    const isEurope = this.isEuropeAddress(destination);

    const options: ShippingCalculation[] = [];

    if (isUK) {
      // UK Shipping Options
      if (!hasLargeItems && totalWeight <= 2) {
        options.push({
          method: "Royal Mail First Class",
          cost: 4.95,
          estimatedDays: "1-2",
          trackingAvailable: true
        });
      }

      if (totalWeight <= 10) {
        options.push({
          method: "DPD Next Working Day",
          cost: 9.95,
          estimatedDays: "1",
          trackingAvailable: true
        });
      }

      options.push({
        method: "DPD 2-3 Day Service",
        cost: 7.95,
        estimatedDays: "2-3",
        trackingAvailable: true
      });

      if (hasLargeItems || totalWeight > 10) {
        options.push({
          method: "Specialist Courier",
          cost: 25.95,
          estimatedDays: "3-5",
          trackingAvailable: true
        });
      }
    } else if (isEurope) {
      // European Shipping
      if (totalWeight <= 2) {
        options.push({
          method: "European Standard",
          cost: 12.95,
          estimatedDays: "5-7",
          trackingAvailable: true
        });
      }

      options.push({
        method: "European Express",
        cost: 24.95,
        estimatedDays: "3-5",
        trackingAvailable: true
      });

      if (hasLargeItems) {
        options.push({
          method: "European Specialist",
          cost: 49.95,
          estimatedDays: "7-10",
          trackingAvailable: true
        });
      }
    } else {
      // International Shipping
      if (totalWeight <= 2) {
        options.push({
          method: "International Standard",
          cost: 15.95,
          estimatedDays: "7-14",
          trackingAvailable: true
        });
      }

      options.push({
        method: "International Express",
        cost: 39.95,
        estimatedDays: "3-7",
        trackingAvailable: true
      });

      if (hasLargeItems) {
        options.push({
          method: "International Specialist",
          cost: 79.95,
          estimatedDays: "10-21",
          trackingAvailable: true
        });
      }
    }

    return options;
  }

  /**
   * Calculate total weight of items
   */
  private static calculateTotalWeight(items: Array<{ weight?: number; quantity: number }>): number {
    return items.reduce((total, item) => {
      const itemWeight = item.weight || 1; // Default 1kg if no weight specified
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Check if any items are considered large (require special handling)
   */
  private static hasLargeItems(items: Array<{ dimensions?: string }>): boolean {
    return items.some(item => {
      if (!item.dimensions) return false;
      
      // Parse dimensions like "50cm x 30cm x 20cm"
      const dimensions = item.dimensions.toLowerCase().match(/(\d+)/g);
      if (!dimensions || dimensions.length < 3) return false;
      
      const [length, width, height] = dimensions.map(Number);
      
      // Consider large if any dimension > 60cm or total volume > 50,000 cm³
      return length > 60 || width > 60 || height > 60 || (length * width * height) > 50000;
    });
  }

  /**
   * Check if address is in the UK
   */
  private static isUKAddress(address: ShippingAddress): boolean {
    const country = address.country.toLowerCase();
    return country === 'uk' || 
           country === 'united kingdom' || 
           country === 'gb' || 
           country === 'great britain' ||
           country === 'england' ||
           country === 'scotland' ||
           country === 'wales' ||
           country === 'northern ireland';
  }

  /**
   * Check if address is in Europe
   */
  private static isEuropeAddress(address: ShippingAddress): boolean {
    const europeanCountries = [
      'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech republic',
      'denmark', 'estonia', 'finland', 'france', 'germany', 'greece',
      'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg',
      'malta', 'netherlands', 'poland', 'portugal', 'romania', 'slovakia',
      'slovenia', 'spain', 'sweden', 'norway', 'switzerland', 'iceland'
    ];
    
    return europeanCountries.includes(address.country.toLowerCase());
  }

  /**
   * Generate tracking information for an order
   */
  static async generateTrackingInfo(orderId: number): Promise<{
    trackingNumber: string;
    carrier: string;
    trackingUrl: string;
  } | null> {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order || order.status !== 'shipped') {
        return null;
      }

      // In a real system, this would integrate with actual courier APIs
      // For now, generate a realistic-looking tracking number
      const carriers = ['DPD', 'Royal Mail', 'Evri', 'UPS'];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      
      let trackingNumber: string;
      let trackingUrl: string;

      switch (carrier) {
        case 'DPD':
          trackingNumber = `DPD${Date.now().toString().slice(-10)}`;
          trackingUrl = `https://www.dpd.co.uk/apps/tracking/?reference=${trackingNumber}`;
          break;
        case 'Royal Mail':
          trackingNumber = `RM${Date.now().toString().slice(-12)}GB`;
          trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
          break;
        case 'Evri':
          trackingNumber = `EV${Date.now().toString().slice(-10)}`;
          trackingUrl = `https://www.evri.com/track/parcel/${trackingNumber}`;
          break;
        case 'UPS':
          trackingNumber = `1Z${Date.now().toString().slice(-12)}`;
          trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
          break;
        default:
          trackingNumber = `TRK${Date.now().toString().slice(-10)}`;
          trackingUrl = '#';
      }

      return {
        trackingNumber,
        carrier,
        trackingUrl
      };
    } catch (error) {
      console.error("Error generating tracking info:", error);
      return null;
    }
  }

  /**
   * Validate UK postcode format
   */
  static validateUKPostcode(postcode: string): boolean {
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode.replace(/\s/g, ''));
  }

  /**
   * Estimate delivery date based on shipping method
   */
  static estimateDeliveryDate(shippingMethod: string, orderDate: Date = new Date()): Date {
    const deliveryDate = new Date(orderDate);
    
    // Add processing time (1-2 business days)
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    
    // Skip weekends for processing
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    // Add delivery time based on method
    if (shippingMethod.includes('Next Working Day')) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    } else if (shippingMethod.includes('First Class') || shippingMethod.includes('1-2')) {
      deliveryDate.setDate(deliveryDate.getDate() + 2);
    } else if (shippingMethod.includes('2-3')) {
      deliveryDate.setDate(deliveryDate.getDate() + 3);
    } else if (shippingMethod.includes('3-5')) {
      deliveryDate.setDate(deliveryDate.getDate() + 5);
    } else if (shippingMethod.includes('5-7')) {
      deliveryDate.setDate(deliveryDate.getDate() + 7);
    } else if (shippingMethod.includes('7-14')) {
      deliveryDate.setDate(deliveryDate.getDate() + 14);
    } else {
      // Default to 5 business days
      deliveryDate.setDate(deliveryDate.getDate() + 5);
    }
    
    // Skip weekends for delivery
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    return deliveryDate;
  }
}