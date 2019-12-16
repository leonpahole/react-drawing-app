import React, { useEffect, useRef, useCallback, useState } from "react";
import roomStyles from "../styles/rooms.module.scss";
import DrawingDashboard from "./DrawingDashboard";
import ButtonWithSpinner from "./ButtonWithSpinner";

const Canvas = props => {
  const {
    onDraw,
    coordinates,
    isDrawingAllowed = false,
    userCurrentlyDrawing,
    currentWord
  } = props;

  const canvas = useRef(null);
  const divWrapper = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePosition, setMousePosition] = useState(null);

  useEffect(() => {
    if (!canvas.current) return;

    const context = canvas.current.getContext("2d");

    if (coordinates && coordinates.length > 1) {
      let count = 0;

      for (let i = coordinates.length - 1; i >= 0; i--) {
        if (coordinates[i].x === -2) {
          count = i + 1;
          context.clearRect(0, 0, canvas.current.width, canvas.current.height);
          break;
        }
      }

      while (count < coordinates.length) {
        context.beginPath();
        context.strokeStyle = "black";
        context.lineJoin = "round";
        context.lineWidth = 5;

        context.moveTo(coordinates[count].x, coordinates[count].y);

        let i = count + 1;

        for (; i < coordinates.length && coordinates[i].x !== -1; i++) {
          context.lineTo(coordinates[i].x, coordinates[i].y);
        }

        if (i > count) {
          console.log("stroke");
          context.stroke();
        }

        count = i + 1;

        for (
          ;
          count < coordinates.length && coordinates[count].x === -1;
          count++
        );
      }
    }
  }, [coordinates]);

  useEffect(() => {
    if (!canvas.current) return;

    const context = canvas.current.getContext("2d");
    if (!isDrawingAllowed) {
      context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  }, [isDrawingAllowed]);

  const startDrawing = useCallback(
    e => {
      const coordinates = {
        x: e.pageX - canvas.current.offsetLeft,
        y: e.pageY - canvas.current.offsetTop
      };

      setMousePosition(coordinates);
      onDraw && onDraw(coordinates);
      setIsDrawing(true);
    },
    [onDraw]
  );

  useEffect(() => {
    if (!canvas.current) return;
    canvas.current.width = divWrapper.current.clientWidth;
    canvas.current.height = divWrapper.current.clientHeight;
  }, []);

  useEffect(() => {
    if (!canvas.current) return;
    if (!isDrawingAllowed) return;

    canvas.current.addEventListener("mousedown", startDrawing);

    return () => {
      canvas.current.removeEventListener("mousedown", startDrawing);
    };
  }, [startDrawing, isDrawingAllowed]);

  const draw = useCallback(
    e => {
      if (!isDrawingAllowed) return;
      if (isDrawing) {
        const coordinates = {
          x: e.pageX - canvas.current.offsetLeft,
          y: e.pageY - canvas.current.offsetTop
        };

        if (mousePosition) {
          drawLine(mousePosition, coordinates);
          setMousePosition(coordinates);
          onDraw && onDraw(coordinates);
        }
      }
    },
    [isDrawing, mousePosition, isDrawingAllowed]
  );

  useEffect(() => {
    if (!isDrawingAllowed) return;
    if (!canvas.current) return;

    canvas.current.addEventListener("mousemove", draw);

    return () => {
      canvas.current.removeEventListener("mousemove", draw);
    };
  }, [draw, isDrawingAllowed]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingAllowed) return;
    if (isDrawing) {
      setIsDrawing(false);
      setMousePosition(undefined);

      onDraw({ x: -1, y: -1 });
    }
  }, [onDraw, isDrawing, isDrawingAllowed]);

  useEffect(() => {
    if (!isDrawingAllowed) return;
    if (!canvas.current) return;

    canvas.current.addEventListener("mouseup", stopDrawing);
    canvas.current.addEventListener("mouseleave", stopDrawing);
    return () => {
      canvas.current.removeEventListener("mouseup", stopDrawing);
      canvas.current.removeEventListener("mouseleave", stopDrawing);
    };
  }, [stopDrawing, isDrawingAllowed]);

  const drawLine = (originalMousePosition, newMousePosition) => {
    if (!canvas.current) return;

    const context = canvas.current.getContext("2d");

    if (context) {
      context.strokeStyle = "black";
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
    }
  };

  const onClear = useCallback(() => {
    if (!canvas.current) return;

    const context = canvas.current.getContext("2d");
    onDraw({ x: -2, y: -2 });

    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }, [onDraw, isDrawing]);

  return (
    <>
      <div ref={divWrapper} className={roomStyles.canvasInnerWrapper}>
        <canvas ref={canvas} className={roomStyles.canvas} />
        {isDrawingAllowed && (
          <div className={roomStyles.canvasClearButton}>
            <ButtonWithSpinner
              onSubmit={onClear}
              text={"Clear"}
            ></ButtonWithSpinner>
          </div>
        )}
      </div>
    </>
  );
};

export default Canvas;
