"use client";

import { Header } from "@/components/layout/Header";

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-surface pb-10">
      <Header title="Публичная оферта" />
      <div className="p-4 space-y-4 text-sm leading-relaxed text-foreground">
        <h1 className="text-lg font-semibold">Публичная оферта и согласие на обработку персональных данных</h1>

        <section className="space-y-2">
          <h2 className="font-semibold">1. Общие положения</h2>
          <p>
            Настоящий документ является официальным предложением (публичной офертой) сервиса доставки и
            самовывоза еды. Совершая заказ, пользователь подтверждает согласие со всеми условиями.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">2. Предмет оферты</h2>
          <p>
            Сервис обязуется передать заказанные пользователем товары ресторанов, а пользователь — оплатить
            и принять заказ выбранным способом (доставка либо самовывоз).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">3. Стоимость и оплата</h2>
          <p>
            Итоговая стоимость заказа складывается из стоимости позиций, доставки (рассчитывается через
            сервис JURA) и чаевых (по желанию). Оплата производится наличными при получении или картой через
            DC Bank.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">4. Обработка персональных данных</h2>
          <p>
            Пользователь даёт согласие на обработку персональных данных (ФИО, телефон, адрес, история
            заказов), необходимых для исполнения заказа, в соответствии с законодательством Республики
            Таджикистан.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">5. Отмена и возврат</h2>
          <p>
            Заказ может быть отменён до момента передачи курьеру. При неоплате онлайн-заказа в течение 2
            часов он автоматически отменяется системой.
          </p>
        </section>

        <p className="text-muted text-xs pt-4">
          Это упрощённая версия документа. Полный текст оферты предоставляется по запросу.
        </p>
      </div>
    </div>
  );
}
